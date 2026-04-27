use anchor_lang::prelude::*;

use crate::{models::TimeOffRecord, utils::TIME_OFF_RECORD_TAG};

#[derive(Accounts)]
#[instruction(_hash: [u8; 32],)]
pub struct DeleteRecord<'info> {
    #[account(
        seeds = [TIME_OFF_RECORD_TAG, _hash.as_ref()],
        bump = record_account.bump_seed,
        mut, close = signer
    )]
    record_account: Account<'info, TimeOffRecord>,

    #[account(mut)]
    signer: Signer<'info>,
}

pub fn delete_record(_ctx: Context<DeleteRecord>, _hash: [u8; 32]) -> Result<()> {
    Ok(())
}
