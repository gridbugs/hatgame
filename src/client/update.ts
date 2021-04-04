import { either } from 'fp-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import * as u from '../common/update';
import * as w from '../common/websocket_api';

export async function sendUpdate(
  { socket, update }: { socket: SocketIOClient.Socket, update: u.Update }
): Promise<void> {
  console.log(`sending update: ${JSON.stringify(update)}`);
  const updateEncoded = u.UpdateT.encode(update);
  return new Promise((resolve, reject) => {
    socket.emit(w.Update, updateEncoded, (resultEncoded: any) => {
      const result = u.UpdateResultT.decode(resultEncoded);
      if (either.isRight(result)) {
        if (either.isRight(result.right)) {
          resolve();
        } else {
          switch (result.right.left.tag) {
            case 'DecodingFailed': {
              reject(new Error(`failed to decode update: ${JSON.stringify(updateEncoded)}`));
              break;
            }
            case 'UpdateFailed': {
              reject(new Error(`update failed (${result.right.left.reason})`));
              break;
            }
          }
        }
      } else {
        reject(new Error(PathReporter.report(result).join('')));
      }
    });
  });
}
