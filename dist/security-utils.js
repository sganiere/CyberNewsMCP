import { URL } from 'url';
export class SecurityUtils {
    static ALLOWED_PROTOCOLS = ['http:', 'https:'];
    static BLOCKED_HOSTS = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '::1',
        'metadata.google.internal',
        '169.254.169.254', // AWS metadata
        '100.64.0.0/10', // Carrier-grade NAT
        '172.16.0.0/12', // Private network
        '192.168.0.0/16', // Private network
        '10.0.0.0/8' // Private network
    ];
    /**
     * Validates URL against SSRF attacks
     */
    static validateUrl(urlString) {
        try {
            const url = new URL(urlString);
            // Check protocol
            if (!this.ALLOWED_PROTOCOLS.includes(url.protocol)) {
                return { isValid: false, error: 'Invalid protocol. Only HTTP and HTTPS are allowed.' };
            }
            // Check for blocked hosts
            const hostname = url.hostname.toLowerCase();
            // Block localhost variants
            if (this.isLocalhost(hostname)) {
                return { isValid: false, error: 'Access to localhost is not allowed.' };
            }
            // Block private IP ranges
            if (this.isPrivateIP(hostname)) {
                return { isValid: false, error: 'Access to private IP ranges is not allowed.' };
            }
            // Block metadata endpoints
            if (this.isMetadataEndpoint(hostname)) {
                return { isValid: false, error: 'Access to metadata endpoints is not allowed.' };
            }
            // Additional length check
            if (urlString.length > 2048) {
                return { isValid: false, error: 'URL too long.' };
            }
            return { isValid: true };
        }
        catch (error) {
            return { isValid: false, error: 'Invalid URL format.' };
        }
    }
    static isLocalhost(hostname) {
        return hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '0.0.0.0' ||
            hostname === '::1' ||
            hostname.endsWith('.localhost');
    }
    static isPrivateIP(hostname) {
        // Simple IP validation for common private ranges
        const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
        const match = hostname.match(ipv4Regex);
        if (!match)
            return false;
        const octets = match.slice(1).map(Number);
        // Check if all octets are valid
        if (octets.some(octet => octet < 0 || octet > 255))
            return false;
        // Check private IP ranges
        return (
        // 10.0.0.0/8
        octets[0] === 10 ||
            // 172.16.0.0/12
            (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
            // 192.168.0.0/16
            (octets[0] === 192 && octets[1] === 168) ||
            // 127.0.0.0/8 (loopback)
            octets[0] === 127);
    }
    static isMetadataEndpoint(hostname) {
        const metadataHosts = [
            'metadata.google.internal',
            '169.254.169.254'
        ];
        return metadataHosts.includes(hostname);
    }
    /**
     * Sanitizes text content to prevent XSS and other injection attacks
     */
    static sanitizeText(text, maxLength = 10000) {
        if (!text)
            return '';
        // Limit text length
        let sanitized = text.substring(0, maxLength);
        // Remove potential script tags and dangerous content
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
        sanitized = sanitized.replace(/javascript:/gi, '');
        sanitized = sanitized.replace(/data:/gi, '');
        sanitized = sanitized.replace(/vbscript:/gi, '');
        return sanitized.trim();
    }
    /**
     * Validates and sanitizes keyword input
     */
    static validateKeywords(keywords) {
        if (!Array.isArray(keywords)) {
            return { isValid: false, sanitized: [], error: 'Keywords must be an array.' };
        }
        if (keywords.length === 0) {
            return { isValid: false, sanitized: [], error: 'At least one keyword is required.' };
        }
        if (keywords.length > 20) {
            return { isValid: false, sanitized: [], error: 'Too many keywords. Maximum 20 allowed.' };
        }
        const sanitized = [];
        for (const keyword of keywords) {
            if (typeof keyword !== 'string') {
                return { isValid: false, sanitized: [], error: 'All keywords must be strings.' };
            }
            const trimmed = keyword.trim();
            if (trimmed.length === 0) {
                continue; // Skip empty keywords
            }
            if (trimmed.length > 100) {
                return { isValid: false, sanitized: [], error: 'Keyword too long. Maximum 100 characters per keyword.' };
            }
            // Basic sanitization
            const sanitizedKeyword = this.sanitizeText(trimmed, 100);
            sanitized.push(sanitizedKeyword);
        }
        if (sanitized.length === 0) {
            return { isValid: false, sanitized: [], error: 'No valid keywords found after sanitization.' };
        }
        return { isValid: true, sanitized };
    }
    /**
     * Validates date input
     */
    static validateDate(dateString) {
        if (!dateString) {
            return { isValid: false, error: 'Date string is required.' };
        }
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return { isValid: false, error: 'Invalid date format.' };
            }
            // Check if date is reasonable (not too far in past or future)
            const now = new Date();
            const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            if (date < oneYearAgo || date > oneYearFromNow) {
                return { isValid: false, error: 'Date must be within one year of current date.' };
            }
            return { isValid: true, date };
        }
        catch (error) {
            return { isValid: false, error: 'Invalid date format.' };
        }
    }
    /**
     * Validates numeric input with bounds
     */
    static validateNumber(value, min = 0, max = 1000) {
        if (typeof value !== 'number' || isNaN(value)) {
            return { isValid: false, error: 'Value must be a valid number.' };
        }
        if (value < min || value > max) {
            return { isValid: false, error: `Value must be between ${min} and ${max}.` };
        }
        return { isValid: true };
    }
}
//# sourceMappingURL=security-utils.js.map