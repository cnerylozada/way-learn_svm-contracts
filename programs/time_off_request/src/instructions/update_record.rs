use crate::models::{Status, TransferRecord};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(_hash: [u8; 32])]
pub struct UpdateRecord<'info> {
    #[account(
        seeds = [b"transfer_record", _hash.as_ref()],
        bump = record_account.bump_seed,
        mut,
    )]
    record_account: Account<'info, TransferRecord>,

    #[account(mut)]
    signer: Signer<'info>,
}

pub fn update_record(_ctx: Context<UpdateRecord>, _hash: [u8; 32], _status: Status) -> Result<()> {
    let record_account = &mut _ctx.accounts.record_account;
    record_account.status = _status;

    Ok(())
}
