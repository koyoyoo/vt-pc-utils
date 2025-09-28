import CryptoJS from "crypto-js";

/**
 * AES加密模式类型
 */
export type AESMode = "ECB" | "CBC" | "CFB" | "OFB";

/**
 * AES填充模式类型
 */
export type AESPadding = "Pkcs7" | "AnsiX923" | "Iso10126" | "ZeroPadding";

/**
 * 输出格式类型
 */
export type OutputFormat = "Base64" | "Hex";

/**
 * AES加密模式常量
 */
export const AES_MODES = {
  ECB: "ECB",
  CBC: "CBC",
  CFB: "CFB",
  OFB: "OFB"
} as const;

/**
 * AES填充模式常量
 */
export const AES_PADDINGS = {
  Pkcs7: "Pkcs7",
  AnsiX923: "AnsiX923",
  Iso10126: "Iso10126",
  ZeroPadding: "ZeroPadding"
} as const;

/**
 * 输出格式常量
 */
export const OUTPUT_FORMATS = {
  Base64: "Base64",
  Hex: "Hex"
} as const;

/**
 * AES加密配置接口
 */
export interface AESConfig {
  /** 加密模式 */
  mode?: AESMode;
  /** 填充模式 */
  padding?: AESPadding;
  /** 输出格式 */
  outputFormat?: OutputFormat;
}

/**
 * AES加密结果接口
 */
export interface AESResult {
  /** 是否成功 */
  success: boolean;
  /** 结果数据 */
  data?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 默认AES配置
 */
const DEFAULT_CONFIG: Required<AESConfig> = {
  mode: "CBC",
  padding: "Pkcs7",
  outputFormat: "Base64"
};

/**
 * 生成随机密钥
 * @param length 密钥长度（字节数），默认16字节（128位）
 * @returns 随机生成的密钥字符串
 */
export function generateRandomKey(length: number = 16): string {
  return CryptoJS.lib.WordArray.random(length).toString();
}

/**
 * AES加密
 * @param plainText 要加密的明文
 * @param secretKey 密钥
 * @param config 加密配置
 * @returns 加密结果
 */
export function aesEncrypt(
  plainText: string,
  secretKey: string,
  config: AESConfig = {}
): AESResult {
  try {
    // 参数验证
    if (!plainText?.trim()) {
      return {
        success: false,
        error: "明文不能为空",
      };
    }

    if (!secretKey?.trim()) {
      return {
        success: false,
        error: "密钥不能为空",
      };
    }

    // 合并配置
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // 获取加密配置
    const mode = (CryptoJS.mode as any)[finalConfig.mode];
    const padding = (CryptoJS.pad as any)[finalConfig.padding];

    if (!mode) {
      return {
        success: false,
        error: `不支持的加密模式: ${finalConfig.mode}`,
      };
    }

    if (!padding) {
      return {
        success: false,
        error: `不支持的填充模式: ${finalConfig.padding}`,
      };
    }

    // 处理密钥 - 根据输出格式选择密钥处理方式
    let key: string | CryptoJS.lib.WordArray;
    if (finalConfig.outputFormat === "Base64") {
      // Base64格式使用字符串密钥，让CryptoJS自动处理
      key = secretKey;
    } else {
      // Hex格式使用解析后的密钥，确保一致性
      key = CryptoJS.enc.Utf8.parse(secretKey);
    }

    // 生成随机IV（除了ECB模式）
    let iv: CryptoJS.lib.WordArray | undefined;
    if (finalConfig.mode !== "ECB") {
      iv = CryptoJS.lib.WordArray.random(16); // 16字节IV
    }

    // 执行加密
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      mode: mode,
      padding: padding,
      iv: iv,
    });

    // 根据输出格式转换结果
    let result: string;
    if (finalConfig.outputFormat === "Base64") {
      // Base64格式：CryptoJS会自动包含IV
      result = encrypted.toString();
    } else {
      // Hex格式：需要手动处理IV和密文
      if (finalConfig.mode === "ECB") {
        // ECB模式不使用IV
        result = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
      } else {
        // 其他模式需要包含IV
        if (!iv) {
          return {
            success: false,
            error: "IV生成失败",
          };
        }
        const ivHex = iv.toString(CryptoJS.enc.Hex);
        const ciphertextHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
        result = ivHex + ciphertextHex;
      }
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: `加密失败: ${(error as Error).message}`,
    };
  }
}

/**
 * AES解密
 * @param cipherText 要解密的密文
 * @param secretKey 密钥
 * @param config 解密配置
 * @returns 解密结果
 */
export function aesDecrypt(
  cipherText: string,
  secretKey: string,
  config: AESConfig = {}
): AESResult {
  try {
    // 参数验证
    if (!cipherText?.trim()) {
      return {
        success: false,
        error: "密文不能为空",
      };
    }

    if (!secretKey?.trim()) {
      return {
        success: false,
        error: "密钥不能为空",
      };
    }

    // 合并配置
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // 获取解密配置
    const mode = (CryptoJS.mode as any)[finalConfig.mode];
    const padding = (CryptoJS.pad as any)[finalConfig.padding];

    if (!mode) {
      return {
        success: false,
        error: `不支持的加密模式: ${finalConfig.mode}`,
      };
    }

    if (!padding) {
      return {
        success: false,
        error: `不支持的填充模式: ${finalConfig.padding}`,
      };
    }

    // 处理密钥 - 根据输出格式选择密钥处理方式
    let key: string | CryptoJS.lib.WordArray;
    if (finalConfig.outputFormat === "Base64") {
      // Base64格式使用字符串密钥，让CryptoJS自动处理
      key = secretKey;
    } else {
      // Hex格式使用解析后的密钥，确保一致性
      key = CryptoJS.enc.Utf8.parse(secretKey);
    }

    let decrypted;

    // 根据输出格式处理密文
    if (finalConfig.outputFormat === "Base64") {
      // Base64格式：CryptoJS会自动处理IV
      if (finalConfig.mode === "ECB") {
        // ECB模式不使用IV
        decrypted = CryptoJS.AES.decrypt(cipherText, key, {
          mode: mode,
          padding: padding,
        });
      } else {
        // 其他模式需要生成IV进行解密
        decrypted = CryptoJS.AES.decrypt(cipherText, key, {
          mode: mode,
          padding: padding,
        });
      }
    } else {
      // Hex格式需要特殊处理
      if (finalConfig.mode === "ECB") {
        // ECB模式不使用IV，直接解析密文
        const cipherParams = CryptoJS.lib.CipherParams.create({
          ciphertext: CryptoJS.enc.Hex.parse(cipherText),
        });
        decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
          mode: mode,
          padding: padding,
        });
      } else {
        // 其他模式需要分离IV和密文
        // IV长度为16字节（32个十六进制字符）
        const ivLength = 32;
        
        if (cipherText.length < ivLength) {
          return {
            success: false,
            error: "Hex格式密文长度不足，无法提取IV",
          };
        }
        
        const ivHex = cipherText.substring(0, ivLength);
        const ciphertextHex = cipherText.substring(ivLength);
        
        const iv = CryptoJS.enc.Hex.parse(ivHex);
        const ciphertext = CryptoJS.enc.Hex.parse(ciphertextHex);
        
        const cipherParams = CryptoJS.lib.CipherParams.create({
          ciphertext: ciphertext,
        });
        
        decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
          mode: mode,
          padding: padding,
          iv: iv,
        });
      }
    }

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      return {
        success: false,
        error: "解密失败，请检查密钥、密文格式和加密参数是否正确",
      };
    }

    return {
      success: true,
      data: decryptedText,
    };
  } catch (error) {
    return {
      success: false,
      error: `解密失败: ${(error as Error).message}`,
    };
  }
}

/**
 * AES工具类
 * 提供更便捷的链式调用方式
 */
export class AESCrypto {
  private config: Required<AESConfig>;

  constructor(config: AESConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 设置加密模式
   */
  setMode(mode: AESMode): AESCrypto {
    this.config.mode = mode;
    return this;
  }

  /**
   * 设置填充模式
   */
  setPadding(padding: AESPadding): AESCrypto {
    this.config.padding = padding;
    return this;
  }

  /**
   * 设置输出格式
   */
  setOutputFormat(format: OutputFormat): AESCrypto {
    this.config.outputFormat = format;
    return this;
  }

  /**
   * 加密
   */
  encrypt(plainText: string, secretKey: string): AESResult {
    return aesEncrypt(plainText, secretKey, this.config);
  }

  /**
   * 解密
   */
  decrypt(cipherText: string, secretKey: string): AESResult {
    return aesDecrypt(cipherText, secretKey, this.config);
  }

  /**
   * 生成随机密钥
   */
  generateKey(length: number = 16): string {
    return generateRandomKey(length);
  }
}

/**
 * 创建AES加密工具实例
 */
export function createAESCrypto(config?: AESConfig): AESCrypto {
  return new AESCrypto(config);
}

// 导出默认实例
export const aesCrypto = new AESCrypto();
