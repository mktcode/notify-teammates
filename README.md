# Notify Teammates

Notify teammates by mentioning their Git user name in the code. The user will see a notification in VS Code when pulling changes.

```typescript
// @mktcode: Please comment or refactor!!!
function m(p: number, q: number, i: number): boolean {
  let a = 0, b = 0, t: number, n: number;
  for (n = 0; n < i; n++) {
    t = a * a - b * b + p;
    b = 2 * a * b + q;
    a = t;
    if (a * a + b * b > 4) break;
  }
  return n === i;
}
```

![Notification screenshot](/screenshot.png)

## Requirements

You need to use git and have a username configured:

```bash
git config --global user.name "John Doe"
```

Then this extension will watch your git repository for changes and notify you, e.g. after a `git pull`, if you have been mentioned in the code.

To mention someone, use the following syntax anywhere in a file (that is not `.gitignore`ed in your repository):

```bash
@John Doe: This code is broken. Please fix it and remove this comment.
```