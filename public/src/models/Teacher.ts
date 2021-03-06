export default class Teacher {

  private _realname: string;
  public get realname() { return this._realname; }

  private _username: string;
  public get username() { return this._username; }

  public constructor(data: any) {
    this._realname = data.realname || '';
    this._username = data.username || '';
  }

  public clone(): Teacher {
    return new Teacher({
      realname: this._realname,
      username: this._username
    });
  }
}
