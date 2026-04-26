use crate::errors::CustomError;
use crate::models::{Status, TimeOffRecord};
use crate::utils::{ACCOUNT_DISCRIMINATOR, EMPLOYEE_VAULT_TAG, TIME_OFF_RECORD_TAG};
use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

#[derive(Accounts)]
#[instruction(_hash: [u8; 32],)]
pub struct CreateRecord<'info> {
    #[account(init, payer = signer,
        space = ACCOUNT_DISCRIMINATOR + TimeOffRecord::INIT_SPACE,
        seeds = [TIME_OFF_RECORD_TAG, _hash.as_ref(), ],
        bump
    )]
    record_account: Account<'info, TimeOffRecord>,

    #[account(
        mut,
        seeds = [EMPLOYEE_VAULT_TAG, _hash.as_ref()],
        bump,
    )]
    pub employee_vault_account: SystemAccount<'info>,

    #[account(mut)]
    signer: Signer<'info>,

    system_program: Program<'info, System>,
}

pub fn create_record(
    _ctx: Context<CreateRecord>,
    _hash: [u8; 32],
    _time_off_request_id: String,
    _employee_id: String,
) -> Result<()> {
    let record = &mut _ctx.accounts.record_account;

    record.time_off_request_id = _time_off_request_id;
    record.employee_pub_key = _ctx.accounts.signer.key();
    record.employee_id = _employee_id;
    record.status = Status::pending;
    record.bump_seed = _ctx.bumps.record_account;

    let transfer_accounts = Transfer {
        from: _ctx.accounts.signer.to_account_info(),
        to: _ctx.accounts.employee_vault_account.to_account_info(),
    };

    let cpi_context = CpiContext::new(
        _ctx.accounts.system_program.to_account_info(),
        transfer_accounts,
    );

    let transfer_tx = transfer(cpi_context, 1_000_000);
    if transfer_tx.is_err() {
        return Err(CustomError::TransferError.into());
    }

    Ok(())
}
