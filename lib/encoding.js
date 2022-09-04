export const base64Encode = (text) => {
    return Buffer.from(text).toString("base64")
}