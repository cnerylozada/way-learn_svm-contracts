use crate::{
    models::AdminAccount,
    utils::{ACCOUNT_DISCRIMINATOR, ADMIN_TAG},
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetAdmin<'info> {
    #[account(
        init, payer = signer,
        space = ACCOUNT_DISCRIMINATOR + AdminAccount::INIT_SPACE,
        seeds = [ADMIN_TAG, signer.key.as_ref()],
        bump
    )]
    admin_account: Account<'info, AdminAccount>,

    #[account(mut)]
    signer: Signer<'info>,

    system_program: Program<'info, System>,
}

pub fn set_admin(_ctx: Context<SetAdmin>) -> Result<()> {
    let admin_account = &mut _ctx.accounts.admin_account;
    admin_account.user = _ctx.accounts.signer.key();
    admin_account.bump_seed = _ctx.bumps.admin_account;

    Ok(())
}
