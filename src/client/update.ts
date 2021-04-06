import { either } from 'fp-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import * as u from '../common/update';
import * as w from '../common/websocket_api';

function parseResult(resultEncoded: any): either.Either<Error, 'Ok'> {
  const result = u.UpdateResultT.decode(resultEncoded);
  if (either.isRight(result)) {
    if (either.isRight(result.right)) {
      return either.right('Ok');
    }
    switch (result.right.left.tag) {
      case 'DecodingFailed': {
        return either.left(new Error('failed to decode update'));
      }
      case 'UpdateFailed': {
        return either.left(new Error(`update failed (${result.right.left.reason})`));
      }
    }
  } else {
    return either.left(new Error(PathReporter.report(result).join('')));
  }
}

export async function sendUpdateSocketIO(
  { socket, update }: { socket: SocketIOClient.Socket, update: u.Update }
): Promise<void> {
  console.log(`sending update: ${JSON.stringify(update)}`);
  const updateEncoded = u.UpdateT.encode(update);
  return new Promise((resolve, reject) => {
    socket.emit(w.Update, updateEncoded, (resultEncoded: any) => {
      const result = parseResult(resultEncoded);
      if (either.isRight(result)) {
        resolve();
      } else {
        reject(result.left);
      }
    });
  });
}

export async function sendUpdateSocketHttp(
  { room, update }: { room: string, update: u.Update }
): Promise<void> {
  console.log(`sending update: ${JSON.stringify(update)}`);
  const updateEncoded = u.UpdateT.encode(update);
  const updateEscaped = encodeURIComponent(JSON.stringify(updateEncoded));
  const resultEncoded = await (await fetch(`/update/${room}/${updateEscaped}`)).json();
  const result = parseResult(resultEncoded);
  if (either.isLeft(result)) {
    throw result.left;
  }
}
