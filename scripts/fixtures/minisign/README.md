# minisign test vectors

These files are public test vectors made by the real minisign tool. They come from the tests of the `minisign-verify` crate, version 0.3.0 (`src/lib.rs`, tests `verify` and `verify_prehashed`). They contain no secret key.

- `public.pub`: the public key, key id `E7620F1842B4E81F`.
- `message.txt`: the signed message, the 4 bytes `test`.
- `prehashed.minisig`: a prehashed (`ED`) signature of the message.
- `legacy.minisig`: a legacy (`Ed`) signature of the message, which the framework tools must refuse.
