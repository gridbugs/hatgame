import * as q from '../common/query';

export async function currentUserUuid(): Promise<string> {
  return (await fetch(q.path('CurrentUserUuid'))).text();
}
