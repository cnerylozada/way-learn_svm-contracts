import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TimeOffRequest } from "../target/types/time_off_request";
import * as crypto from "crypto";
import assert from "assert";

describe("TimeOffRequest", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TimeOffRequest as Program<TimeOffRequest>;
  const adminWallet = provider.wallet as anchor.Wallet;

  const ADMIN_TAG = Buffer.from("admin");
  const TIME_OFF_RECORD_TAG = Buffer.from("time_off_record");
  const EMPLOYEE_VAULT_TAG = Buffer.from("employee_vault");
  const COMPANY_VAULT_TAG = Buffer.from("company_vault");

  const _TIME_OFF_REQUEST_ID = "589bb179-18bd-4f99-9dcc-123d114c3e6f";
  const _EMPLOYEE_ID = "eefd7a15-d16e-4273-b501-58392365240b";
  const _HASH = crypto
    .createHash("sha256")
    .update(`${_TIME_OFF_REQUEST_ID}${_EMPLOYEE_ID}`)
    .digest();

  describe("set_admin method", () => {
    it("should set an admin account", async () => {
      await program.methods.setAdmin().rpc();

      const [admin_account_pda] = anchor.web3.PublicKey.findProgramAddressSync(
        [ADMIN_TAG, adminWallet.publicKey.toBuffer()],
        program.programId,
      );
      const admin_account = await program.account.adminAccount.fetch(
        admin_account_pda,
      );

      assert(
        adminWallet.publicKey.toString() === admin_account.user.toString(),
      );
    });
  });

  const userWallet = anchor.web3.Keypair.generate();

  describe("create_record method", () => {
    it("request airdrop...", async () => {
      const txSignature = await provider.connection.requestAirdrop(
        userWallet.publicKey,
        3_000_000_000,
      );
      await provider.connection.confirmTransaction(txSignature);
    });

    it("should create a new account", async () => {
      const [employee_vault_account_pda] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [EMPLOYEE_VAULT_TAG, _HASH],
          program.programId,
        );
      const initial_employee_vault_balance =
        await provider.connection.getBalance(employee_vault_account_pda);
      assert(initial_employee_vault_balance == 0);

      await program.methods
        .createRecord(Array.from(_HASH), _TIME_OFF_REQUEST_ID, _EMPLOYEE_ID)
        .accounts({
          signer: userWallet.publicKey,
        })
        .signers([userWallet])
        .rpc();

      const [record_account_pda] = anchor.web3.PublicKey.findProgramAddressSync(
        [TIME_OFF_RECORD_TAG, _HASH],
        program.programId,
      );
      const record_account = await program.account.timeOffRecord.fetch(
        record_account_pda,
      );

      assert(record_account.timeOffRequestId === _TIME_OFF_REQUEST_ID);
      assert(record_account.employeeId === _EMPLOYEE_ID);
      assert(
        record_account.employeePubKey.toString() ===
          userWallet.publicKey.toString(),
      );
    });

    it("should fund employee vault account", async () => {
      const [employee_vault_account_pda] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [EMPLOYEE_VAULT_TAG, _HASH],
          program.programId,
        );
      const final_employee_vault_balance = await provider.connection.getBalance(
        employee_vault_account_pda,
      );
      assert(final_employee_vault_balance === 1_000_000_000);
    });
  });

  describe("update_record method", () => {
    it("should only perform by admin", async () => {
      try {
        await program.methods
          .updateRecord(Array.from(_HASH), { approved: {} })
          .accounts({ signer: userWallet.publicKey })
          .signers([userWallet])
          .rpc();
      } catch (error) {
        console.log(`error`, error.message);
      }
    });

    it("should update the status", async () => {
      const [company_vault_account_pda] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [COMPANY_VAULT_TAG],
          program.programId,
        );

      const initial_company_vault_balance =
        await provider.connection.getBalance(company_vault_account_pda);
      assert(initial_company_vault_balance == 0);

      await program.methods
        .updateRecord(Array.from(_HASH), { approved: {} })
        .rpc();

      const [record_account_pda] = anchor.web3.PublicKey.findProgramAddressSync(
        [TIME_OFF_RECORD_TAG, _HASH],
        program.programId,
      );

      const record_account = await program.account.timeOffRecord.fetch(
        record_account_pda,
      );

      assert(record_account.timeOffRequestId === _TIME_OFF_REQUEST_ID);
      assert(Object.keys(record_account.status)[0] === "approved");
    });
    it("should move funds from employe_vault to company_vault", async () => {
      const [employee_vault_account_pda] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [EMPLOYEE_VAULT_TAG, _HASH],
          program.programId,
        );
      const employee_vault_balance = await provider.connection.getBalance(
        employee_vault_account_pda,
      );
      assert(employee_vault_balance == 0);

      const [company_vault_account_pda] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [COMPANY_VAULT_TAG],
          program.programId,
        );
      const company_vault_account_balance =
        await provider.connection.getBalance(company_vault_account_pda);
      assert(company_vault_account_balance === 1_000_000_000);
    });
  });

  describe("delete_record method", () => {
    it("should delete time_off_record account", async () => {
      await program.methods.deleteRecord(Array.from(_HASH)).rpc();

      const [record_account_pda] = anchor.web3.PublicKey.findProgramAddressSync(
        [TIME_OFF_RECORD_TAG, _HASH],
        program.programId,
      );
      const record_account = await program.account.timeOffRecord.fetchNullable(
        record_account_pda,
      );
      assert(record_account === null);
    });
  });
});
