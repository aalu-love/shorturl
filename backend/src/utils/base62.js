/**
 * Base62 Encoding for Short Code Generation
 *
 * WHY Base62 over MD5:
 *   MD5 can produce the same first 7 characters for two different URLs
 *   (hash collision) — a fatal bug. Base62 encodes an auto-increment
 *   database ID which is unique by definition. No collision possible.
 *
 * WHY 7 characters:
 *   62^7 = 3,521,614,606,208 combinations (~3.5 trillion).
 *   At 1,200 new URLs/second, this lasts ~93,000 years.
 *
 * Charset: 0-9, a-z, A-Z  (62 characters)
 */

const CHARSET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE = BigInt(CHARSET.length); // 62n
const CODE_LENGTH = parseInt(process.env.SHORT_CODE_LENGTH, 10) || 7;

/**
 * Encode a BIGINT database ID into a Base62 short code.
 * @param {bigint|number|string} id - The auto-increment primary key
 * @returns {string} 7-character Base62 string
 */
const encode = (id) => {
  let num = BigInt(id);

  if (num === 0n) return CHARSET[0].padStart(CODE_LENGTH, CHARSET[0]);

  let code = "";
  while (num > 0n) {
    code = CHARSET[Number(num % BASE)] + code;
    num = num / BASE;
  }

  // Left-pad to CODE_LENGTH for consistent URL length
  return code.padStart(CODE_LENGTH, CHARSET[0]);
};

/**
 * Decode a Base62 short code back to its original numeric ID.
 * Useful for direct DB lookup without index scan.
 * @param {string} code - The 7-character Base62 string
 * @returns {bigint}
 */
const decode = (code) => {
  let num = 0n;
  for (const char of code) {
    const index = CHARSET.indexOf(char);
    if (index === -1) throw new Error(`Invalid Base62 character: ${char}`);
    num = num * BASE + BigInt(index);
  }
  return num;
};

/**
 * Validate that a string is a valid short code format.
 */
const isValidCode = (code) => {
  if (typeof code !== "string") return false;
  if (code.length !== CODE_LENGTH) return false;
  return [...code].every((char) => CHARSET.includes(char));
};

module.exports = { encode, decode, isValidCode, CODE_LENGTH };
