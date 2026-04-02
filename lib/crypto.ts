import CryptoJS from "crypto-js"

const aesKey = process.env.NEXT_PUBLIC_AES_KEY

if (!aesKey) {
  console.error("NEXT_PUBLIC_AES_KEY environment variable is not set")
}

export const encryptAES = (text: string) => {
  if (!aesKey) {
    throw new Error("AES key is not configured")
  }
  const encrypted = CryptoJS.AES.encrypt(text, aesKey)
  return encrypted.toString()
}

export const decryptAES = (cipherText: string) => {
  if (!aesKey) {
    throw new Error("AES key is not configured")
  }
  const bytes = CryptoJS.AES.decrypt(cipherText, aesKey)
  return bytes.toString(CryptoJS.enc.Utf8)
}
