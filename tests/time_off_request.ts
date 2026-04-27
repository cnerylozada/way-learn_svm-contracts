import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TimeOffRequest } from "../target/types/time_off_request";
import * as crypto from "crypto";
import assert from "assert";

describe("TimeOffRequest", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TimeOffRequest as Program<TimeOffRequest>;
  const wallet = provider.wallet as anchor.Wallet;

  const TRANSFER_RECORD_TAG = Buffer.from("time_off_record");
  const EMPLOYEE_VAULT_TAG = Buffer.from("employee_vault");
  const COMPANY_VAULT_TAG = Buffer.from("company_vault");

  describe("set_admin method", () => {
    it("should ...", async () => {
      await program.methods.setAdmin().rpc();
    });
  });

  describe("create_record method", () => {
    it("should create a new account", async () => {
      const _time_off_request_id = "589bb179-18bd-4f99-9dcc-123d114c3e6f";
      const _employee_id = "eefd7a15-d16e-4273-b501-58392365240b";
      const _hash = crypto
        .createHash("sha256")
        .update(`${_time_off_request_id}${_employee_id}`)
        .digest();

      const [employee_vault_account_pda] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [EMPLOYEE_VAULT_TAG, _hash],
          program.programId,
        );
      const initial_employee_vault_balance =
        await provider.connection.getBalance(employee_vault_account_pda);
      assert(initial_employee_vault_balance == 0);

      await program.methods
        .createRecord(Array.from(_hash), _time_off_request_id, _employee_id)
        .rpc();

      const [record_account_pda] = anchor.web3.PublicKey.findProgramAddressSync(
        [TRANSFER_RECORD_TAG, _hash],
        program.programId,
      );
      const record_account = await program.account.timeOffRecord.fetch(
        record_account_pda,
      );

      assert(record_account.timeOffRequestId === _time_off_request_id);
      assert(record_account.employeeId === _employee_id);
      assert(
        record_account.employeePubKey.toString() ===
          wallet.publicKey.toString(),
      );
    });
    it("should fund employee vault account", async () => {
      const _time_off_request_id = "589bb179-18bd-4f99-9dcc-123d114c3e6f";
      const _employee_id = "eefd7a15-d16e-4273-b501-58392365240b";
      const _hash = crypto
        .createHash("sha256")
        .update(`${_time_off_request_id}${_employee_id}`)
        .digest();

      const [employee_vault_account_pda] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [EMPLOYEE_VAULT_TAG, _hash],
          program.programId,
        );
      const final_employee_vault_balance = await provider.connection.getBalance(
        employee_vault_account_pda,
      );
      assert(final_employee_vault_balance === 1_000_000_000);
    });
  });

  describe("update_record method", () => {
    it("should update the status", async () => {
      const _time_off_request_id = "589bb179-18bd-4f99-9dcc-123d114c3e6f";
      const _employee_id = "eefd7a15-d16e-4273-b501-58392365240b";
      const _hash = crypto
        .createHash("sha256")
        .update(`${_time_off_request_id}${_employee_id}`)
        .digest();

      const [company_vault_account_pda] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [COMPANY_VAULT_TAG],
          program.programId,
        );

      const initial_company_vault_balance =
        await provider.connection.getBalance(company_vault_account_pda);
      assert(initial_company_vault_balance == 0);

      await program.methods
        .updateRecord(Array.from(_hash), { approved: {} })
        .rpc();

      const [record_account_pda] = anchor.web3.PublicKey.findProgramAddressSync(
        [TRANSFER_RECORD_TAG, _hash],
        program.programId,
      );

      const record_account = await program.account.timeOffRecord.fetch(
        record_account_pda,
      );

      assert(record_account.timeOffRequestId === _time_off_request_id);
      assert(Object.keys(record_account.status)[0] === "approved");
    });
    it("should move funds from employe_vault to company_vault", async () => {
      const _time_off_request_id = "589bb179-18bd-4f99-9dcc-123d114c3e6f";
      const _employee_id = "eefd7a15-d16e-4273-b501-58392365240b";
      const _hash = crypto
        .createHash("sha256")
        .update(`${_time_off_request_id}${_employee_id}`)
        .digest();
      const [employee_vault_account_pda] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [EMPLOYEE_VAULT_TAG, _hash],
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
});
