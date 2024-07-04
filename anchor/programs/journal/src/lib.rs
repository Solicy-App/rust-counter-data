#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("GCQKq9fHq3H6Jj3QBde2fDGrdRTfixgwtRtJQwpaTPbk");

#[program]
pub mod counter {
  use super::*;

  pub fn create_entry(ctx: Context<CreateEntry>, title: String, message: String) -> Result<()> {
    msg!("Journal Entry Created");
    msg!("Title: {}", title);
    msg!("Message: {}", message);

    let journal_entry: &mut Account<'_, JournalEntryState> = &mut ctx.accounts.journal_entry;
    journal_entry.owner = ctx.accounts.owner.key();
    journal_entry.title = title;
    journal_entry.message = message;
    Ok(())
  }

  pub fn update_entry(
    ctx: Context<UpdateEntry>,
    _title: String,
    new_message: String
  ) -> Result<()> {
    msg!("Journal Entry Updated");
    msg!("Title: {}", _title);
    msg!("Message: {}", new_message);

    let journal_entry: &mut Account<'_, JournalEntryState> = &mut ctx.accounts.journal_entry;
    journal_entry.message = new_message;

    Ok(())
  }

  pub fn delete_entry(_ctx: Context<DeleteEntry>, _title: String) -> Result<()> {
    msg!("Journal entry titled {} deleted", _title);
    Ok(())
  }
}

#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
  pub owner: Pubkey,
  #[max_len(20)]
  pub title: String,
  #[max_len(200)]
  pub message: String,
  pub entry_id: u64,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateEntry<'info> {
  #[account(
    init,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    payer = owner,
    space = 8 + JournalEntryState::INIT_SPACE
  )]
  pub journal_entry: Account<'info, JournalEntryState>,
  #[account(mut)]
  pub owner: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateEntry<'info> {
  #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        realloc = 8 + JournalEntryState::INIT_SPACE,
        realloc::payer = owner,
        realloc::zero = true,
    )]
  pub journal_entry: Account<'info, JournalEntryState>,
  #[account(mut)]
  pub owner: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteEntry<'info> {
  #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        close = owner,
    )]
  pub journal_entry: Account<'info, JournalEntryState>,
  #[account(mut)]
  pub owner: Signer<'info>,
  pub system_program: Program<'info, System>,
}
