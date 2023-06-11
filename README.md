# xerocross.factor

A little Vue widget for computing the prime factors of an integer.  If a web worker is available, computation is offloaded to the worker.

This project has **not been maintained**, and its dev environment `yarn install` will no longer install on a modern computer platform (at least not mine). This app is **deprecated** in favor of Xero-Factor-2, described below.

I wrote a complete rebuild of this app on modern technology. I consider it version 2 of this app, but I also renamed it to Xero-Factor-2, located at https://github.com/xerocross/xero-factor-2.

## Technology

This is an extremely simple Vue 2 project. Originally it was intended to use web workers, which were a relatively new invention at the time, where possible. However, for unknown reasons the web worker script was not checked into the repository and it is lost now.

## Retrospect in 2023

This widget was originally written in 2019. It has a few problems: (1) the development environment will not longer build on a modern platform. (2) This repo should have a file src/js/get-factor-worker.js which creates the web worker, but that file is notably absent. It was never checked into the repo. (3) I have noticed that for some input numbers such as 355675887678792, the list of "factors" includes a non-integer double. I think I have identified one possible reason for this in the source&mdash;or at least *some* logic that I wrote incorrectly back in 2019.

If you are reviewing this code, please bear in mind the year it was written.