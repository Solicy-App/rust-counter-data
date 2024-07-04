'use client';

import {
  Counter,
  CounterIDL,
  getCounterProgram,
  getCounterProgramId,
} from '@my-journal-dapp/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

interface EntryArgs {
  owner: PublicKey,
  title: string,
  message: string,
};

type AccountsForIdl = {
  journalEntry: PublicKey;
  // owner: PublicKey;
  systemProgram: PublicKey;
};

export function useCounterProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getCounterProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getCounterProgram(provider);
  // const program = new Program(CounterIDL as Counter, provider)

  const accounts = useQuery({
    queryKey: ['counter', 'all', { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createEntry = useMutation<string, Error, EntryArgs>({
    mutationKey: ['counter', 'create', { cluster }],
    mutationFn: async ({title, message, owner }) => {
      const [journalEntryAddress] = await PublicKey.findProgramAddress(
        [Buffer.from(title), owner.toBuffer()],
        programId,
      );

      const accountsForCreating: AccountsForIdl = {
        journalEntry: journalEntryAddress,
        // owner,
        systemProgram: new PublicKey('11111111111111111111111111111111'),
      };

      return program.methods.createEntry(title, message).accounts(accountsForCreating).rpc();
    },
    onSuccess: signature => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to initialize account'),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry,
  };
}

export function useCounterProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { programId, program, accounts } = useCounterProgram();

  const accountQuery = useQuery({
    queryKey: ['counter', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  });

  const updateEntry = useMutation<string, Error, EntryArgs>({
    mutationKey: ['counter', 'update', { cluster }],
    mutationFn: async ({title, message, owner }) => {
      const [journalEntryAddress] = await PublicKey.findProgramAddress(
        [Buffer.from(title), owner.toBuffer()],
        programId,
      );

      const accountsForUpdating: AccountsForIdl = {
        journalEntry: journalEntryAddress,
        // owner,
        systemProgram: new PublicKey('11111111111111111111111111111111'),
      };

      return program.methods.updateEntry(title, message).accounts(accountsForUpdating).rpc();
    },
    onSuccess: signature => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to initialize account'),
  });

  

  const deleteEntry = useMutation({
    mutationKey: ['counter', 'delete', { cluster, account }],
    mutationFn: async (title: string) => {
      const accountsForDeleting: AccountsForIdl = {
        journalEntry: account,
        systemProgram: new PublicKey('11111111111111111111111111111111'),
      };

      return program.methods.deleteEntry(title).accounts(accountsForDeleting).rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  return {
    accountQuery,
    updateEntry,
    deleteEntry
  }
}

//   const decrementMutation = useMutation({
//     mutationKey: ['counter', 'decrement', { cluster, account }],
//     mutationFn: () =>
//       program.methods.decrement().accounts({ counter: account }).rpc(),
//     onSuccess: (tx) => {
//       transactionToast(tx);
//       return accountQuery.refetch();
//     },
//   });

//   const incrementMutation = useMutation({
//     mutationKey: ['counter', 'increment', { cluster, account }],
//     mutationFn: () =>
//       program.methods.increment().accounts({ counter: account }).rpc(),
//     onSuccess: (tx) => {
//       transactionToast(tx);
//       return accountQuery.refetch();
//     },
//   });

//   const setMutation = useMutation({
//     mutationKey: ['counter', 'set', { cluster, account }],
//     mutationFn: (value: number) =>
//       program.methods.set(value).accounts({ counter: account }).rpc(),
//     onSuccess: (tx) => {
//       transactionToast(tx);
//       return accountQuery.refetch();
//     },
//   });

//   return {
//     accountQuery,
//     closeMutation,
//     decrementMutation,
//     incrementMutation,
//     setMutation,
//   };
// }
