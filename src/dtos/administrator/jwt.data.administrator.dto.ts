export class JwtDataAdministratorDto {
    administratorId: number;
    username: string;
    ext: number; // unix timestamp
    ip: string;
    ua: string;

    // Konverzija u obican objekat: 
    toPlainObject() {
        return {
            administratorId: this.administratorId,
            username: this.username,
            ext: this.ext,
            ip: this.ip,
            ua: this.ua,
        }
    }
}