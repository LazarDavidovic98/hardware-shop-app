export class ApiResponse {
    status: string;
    statusCode: number;
    message: string | null;
    
    constructor(status: string, errorCode: number, message: string | null = null) {
        this.status = status;
        this.statusCode = errorCode;
        this.message = message;
    }
}