/**
 *  Độ dài từ 4 đến 15 ký tự
 *  Chỉ chứa các chữ cái, số, và dấu gạch dưới
 *  Không chỉ chứa số từ đầu đến cuối
 */
export const REGEX_USERNAME = /^(?![0-9]+$)[A-Za-z0-9_]{4,15}$/
