export class Account {
    constructor(
        public activated: boolean,
        public authorities: string[],
        public email: string,
        public nom: string,
        public langKey: string,
        public prenom: string,
        public login: string,
        public imageUrl: string
    ) {}
}
