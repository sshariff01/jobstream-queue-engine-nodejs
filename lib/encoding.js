export const base64Encode = (text) => {
    return Buffer.from(text).toString("base64")
}

export const base64Decode = (text) => {
    return Buffer.from(text, 'base64').toString('ascii')
}