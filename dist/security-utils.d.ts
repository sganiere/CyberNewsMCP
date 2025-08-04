export declare class SecurityUtils {
    private static readonly ALLOWED_PROTOCOLS;
    private static readonly BLOCKED_HOSTS;
    /**
     * Validates URL against SSRF attacks
     */
    static validateUrl(urlString: string): {
        isValid: boolean;
        error?: string;
    };
    private static isLocalhost;
    private static isPrivateIP;
    private static isMetadataEndpoint;
    /**
     * Sanitizes text content to prevent XSS and other injection attacks
     */
    static sanitizeText(text: string, maxLength?: number): string;
    /**
     * Validates and sanitizes keyword input
     */
    static validateKeywords(keywords: string[]): {
        isValid: boolean;
        sanitized: string[];
        error?: string;
    };
    /**
     * Validates date input
     */
    static validateDate(dateString: string): {
        isValid: boolean;
        date?: Date;
        error?: string;
    };
    /**
     * Validates numeric input with bounds
     */
    static validateNumber(value: number, min?: number, max?: number): {
        isValid: boolean;
        error?: string;
    };
}
//# sourceMappingURL=security-utils.d.ts.map