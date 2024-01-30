/*
 * Amount is a number of base units and decimal precision,
 * expressed using a string for  JSON-compatibility
 * */
export interface Amount {
  /* Amount expressed in base units */
  amount: string;
  /* Number of decimal places in amount */
  decimals: number;
}

/**
 * Parses a string or number into an Amount, given a decimal level
 * @param amount The string or number to parse
 * @param decimals The number of decimals for the token this amount is of
 * @returns An Amount, expressed as base units and decimals
 */
export function parseAmount(amount: string | number, decimals: number): Amount {
  validateAmountInput(amount, decimals);

  amount = amount.toString();

  // TODO :)
  if (amount.includes("e")) throw new Error("Scientific notation is not supported yet by Amount");

  const chunks = amount.split(".");
  if (chunks.length > 2) throw "Too many decimals";

  let [whole, partial] =
    chunks.length === 0 ? ["0", ""] : chunks.length === 1 ? [chunks[0], ""] : chunks;

  partial = partial.padEnd(decimals, "0");

  if (partial.length > decimals) {
    // if we'd be cutting off non-zero decimals, throw
    if (BigInt(partial.substring(decimals)) !== 0n)
      throw new Error("Amount: invalid input. Decimals too low.");

    // otherwise, truncate the partial to exactly the number of decimals
    partial = partial.substring(0, decimals);
  }

  const amountStr = BigInt(whole + partial).toString();
  return { amount: amountStr, decimals };
}
/**
 * A utility function to truncate an amount to some max decimal
 *
 * This is useful for things like the TokenBridge, where we want to truncate
 * the amount to represent a maximum of 8 decimals
 *
 * @param amount the Amount to truncate
 * @param maxDecimals the max number of decimals we want to keep, zeroing out the rest
 * @returns the truncated Amount
 */

export function truncateAmount(amount: Amount, maxDecimals: number): Amount {
  if (amount.decimals <= maxDecimals) return amount;
  const delta = BigInt(amount.decimals - maxDecimals);
  // first scale down to maxDecimals, this will truncate the amount
  const scaledAmount = baseUnits(amount) / 10n ** delta;
  // then scale back to original decimals
  const amt = scaledAmount * 10n ** delta;

  return {
    amount: amt.toString(),
    decimals: amount.decimals,
  };
}

/**
 * Utility function to scale some amount to a given number of decimals
 *
 * This is useful for things like the TokenBridge, where we want to scale
 * the amount from some the over-the-wire 8 decimals
 *
 * @param amount the amount to scale
 * @param toDecimals the number of decimals to scale to
 * @returns the scaled amount
 */
export function scaleAmount(amount: Amount, toDecimals: number): Amount {
  if (amount.decimals === toDecimals) return amount;
  if (amount.amount === "0") return { amount: amount.amount, decimals: toDecimals };

  const delta = toDecimals - amount.decimals;
  // Scaling up is easy; simply add zeroes to the base units value
  if (delta > 0)
    return {
      amount: amount.amount + "0".repeat(delta),
      decimals: toDecimals,
    };

  // Scaling down is trickier; we have to make sure we're not altering the amount.
  // This should be done explicitly using truncateAmount to avoid bugs.
  if (BigInt(amount.amount.substring(amount.amount.length + delta)) === 0n) {
    return {
      amount: amount.amount.substring(0, amount.amount.length + delta),
      decimals: toDecimals,
    };
  }

  throw new Error(
    `scaleAmount(${JSON.stringify(
      amount,
    )}, ${toDecimals}) would result in altered amount. Use truncateAmount first if you intended to truncate it.`,
  );
}

/**
 * Directly creates an Amount given the base units and decimal level
 * @param amount Amount expressed as base units
 * @param decimals The number of decimals for the token this amount is of
 * @returns An Amount, expressed as base units and decimals
 */
export function amountFromBaseUnits(amount: bigint, decimals: number): Amount {
  return { amount: amount.toString(), decimals };
}

/**
 * Returns the base units from an Amount, as a bigint
 * @param amount An Amount
 * @returns A bigint, representing the base units for the Amount
 */
export function baseUnits(amount: Amount): bigint {
  validateAmount(amount);
  return BigInt(amount.amount);
}

/**
 * Formats an Amount as a human-readable string
 * @param amount An Amount
 * @param precision Number of decimal places to render
 * @returns A string representing the Amount as a fixed point number
 */
export function displayAmount(amount: Amount, precision?: number): string {
  validateAmount(amount);

  let whole = amount.amount.substring(0, amount.amount.length - amount.decimals);
  let partial = amount.amount.substring(amount.amount.length - amount.decimals);

  while (partial.length < amount.decimals) {
    partial = "0" + partial;
  }

  if (typeof precision === "number") {
    while (precision < partial.length) {
      if (partial[partial.length - 1] === "0") {
        partial = partial.substring(0, partial.length - 1);
      } else {
        break;
      }
    }
    while (precision > partial.length) {
      partial += "0";
    }
  }

  if (whole.length === 0) whole = "0";

  if (partial.length > 0) {
    return `${whole}.${partial}`;
  } else {
    return whole;
  }
}

function validateAmountInput(amount: number | string, decimals: number): void {
  if (typeof amount === "number") {
    if (!isFinite(amount)) throw new Error("Amount: invalid input. Amount must be finite");
    if (amount < 0) throw new Error("Amount: invalid input. Amount cannot be negative");
  } else {
    if (!/^[0-9\.]*$/.test(amount)) {
      throw new Error("Amount: invalid input. Must only contain digits.");
    }
  }

  if (!isFinite(decimals)) {
    throw new Error("Amount: invalid input. Decimals must be finite");
  }
}

function validateAmount(amount: Amount): void {
  if (!/^[0-9]*$/.test(amount.amount)) {
    throw new Error("Amount: invalid input. Must only contain digits.");
  }
  if (amount.decimals < 0) {
    throw new Error("Amount: invalid input. Decimals must be >= 0");
  }
  if (!isFinite(amount.decimals)) {
    throw new Error("Amount: invalid input. Decimals must be a finite number.");
  }
}
