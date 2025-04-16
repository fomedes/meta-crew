export class WalletDto {
  public manager: string = '';
  public address: string = '';
  public token: string = '';
  public loading?: boolean | null = null;
  public progress?: number | null = null;
  public totalPlayers?: number | null = null;
  public players?: any[] | null = null;
  public error?: string | null = null;
}
