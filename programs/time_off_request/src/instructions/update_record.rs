use crate::{
    errors::CustomError,
    models::{AdminAccount, Status, TimeOffRecord},
    utils::{ADMIN_TAG, COMPANY_VAULT_TAG, EMPLOYEE_VAULT_TAG, TIME_OFF_RECORD_TAG},
};
use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

#[derive(Accounts)]
#[instruction(_hash: [u8; 32])]
pub struct UpdateRecord<'info> {
    #[account(
        seeds = [ADMIN_TAG, signer.key().as_ref()],
        bump = admin_account.bump_seed,
    )]
    admin_account: Account<'info, AdminAccount>,
    #[account(address = admin_account.user)]
    signer: Signer<'info>,

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

    system_program: Program<'info, System>,
}

pub fn update_record(_ctx: Context<UpdateRecord>, _hash: [u8; 32], _status: Status) -> Result<()> {
    let record_account = &mut _ctx.accounts.record_account;
    record_account.status = _status;

    if record_account.status == Status::approved {
        let transfer_accounts = Transfer {
            from: _ctx.accounts.employee_vault_account.to_account_info(),
            to: _ctx.accounts.company_vault_account.to_account_info(),
        };

        let signer_seeds: &[&[&[u8]]] = &[&[
            EMPLOYEE_VAULT_TAG,
            _hash.as_ref(),
            &[_ctx.bumps.employee_vault_account],
        ]];
        let cpi_context = CpiContext::new_with_signer(
            _ctx.accounts.system_program.to_account_info(),
            transfer_accounts,
            signer_seeds,
        );

        let employee_vault_balance = _ctx.accounts.employee_vault_account.get_lamports();
        let transfer_tx = transfer(cpi_context, employee_vault_balance);
        if transfer_tx.is_err() {
            return Err(CustomError::TransferError.into());
        }
    }

    Ok(())
}
