use crate::{
    models::{Status, TimeOffRecord},
    utils::{COMPANY_VAULT_TAG, EMPLOYEE_VAULT_TAG, TIME_OFF_RECORD_TAG},
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(_hash: [u8; 32])]
pub struct UpdateRecord<'info> {
    #[account(
        seeds = [TIME_OFF_RECORD_TAG, _hash.as_ref()],
        bump = record_account.bump_seed,
        mut,
    )]
    record_account: Account<'info, TimeOffRecord>,

    #[account(
        mut,
        seeds = [EMPLOYEE_VAULT_TAG, _hash.as_ref()],
        bump,
    )]
    pub employee_vault_account: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [COMPANY_VAULT_TAG],
        bump,
    )]
    pub company_vault_account: SystemAccount<'info>,

    #[account(mut)]
    signer: Signer<'info>,
}

pub fn update_record(_ctx: Context<UpdateRecord>, _hash: [u8; 32], _status: Status) -> Result<()> {
    let record_account = &mut _ctx.accounts.record_account;
    record_account.status = _status;

    Ok(())
}
