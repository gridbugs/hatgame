import * as t from 'io-ts';
import { either } from 'fp-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import * as u from '../common/update';

export async function sendUpdate(
  { room, update }: { room: string, update: u.Update }
): Promise<t.Validation<u.UpdateResult>> {
  const updateEncoded = u.encodeUpdateForRoom(room, update);
  const updateEscaped = encodeURIComponent(JSON.stringify(updateEncoded));
  const result = await (await fetch(`/update/${updateEscaped}`)).json();
  return u.UpdateResultT.decode(result);
}

export async function sendUpdateOrThrow(
  { room, update }: { room: string, update: u.Update }
): Promise<void> {
  const updateEncoded = u.encodeUpdateForRoom(room, update);
  const updateEscaped = encodeURIComponent(JSON.stringify(updateEncoded));
  const resultEncoded = await (await fetch(`/update/${updateEscaped}`)).json();
  const result = u.UpdateResultT.decode(resultEncoded);
  if (either.isRight(result)) {
    if (either.isLeft(result.right)) {
      switch (result.right.left.tag) {
        case 'DecodingFailed': {
          throw new Error(`failed to decode update: ${JSON.stringify(updateEncoded)}`);
        }
        case 'JsonParsingFailed': {
          throw new Error(`json parsing failed failed for update: ${JSON.stringify(updateEncoded)}`);
        }
        case 'UpdateFailed': {
          throw new Error(`update failed (${result.right.left.reason})`);
        }
      }
    }
  } else {
    const errorMessage = PathReporter.report(result).join('');
    throw new Error(errorMessage);
  }
}
