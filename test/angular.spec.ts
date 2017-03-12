import { Database } from '@ionic/cloud-angular'

@Component( ... )
export class MyPage {
  public chats: Array<string>;
  
  constructor(public db: Database) {
    this.db.connect();
    this.db.collection('chats').watch().subscribe( (chats) => {
      this.chats = chats;
    }, (error) => {
      console.error(error);
    });
  }

  sendMessage(message: string) {
    this.db.collection('chats').store({text: message, time: Date.now()});
  }
}
