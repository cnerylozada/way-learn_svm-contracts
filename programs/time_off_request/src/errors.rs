use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("Transfer failed")]
    TransferError,
}
