let githubName = "sarahciston/penguin"
var githubToken = "9cd5b195d60216b60cdb129d3ea99a2556ad59cf";
let AUTHOR = "Sarah Ciston"
let EMAIL = "ciston@usc.edu"
// let repo = {}
let commit_msg
let PATH 

// Your user can generate these manually at https://github.com/settings/tokens/new
// Or you can use an oauth flow to get a token for the user.
        

let g5 = { //G5 js designs the whole module as a JS object

    // repo: {},

    load: function (githubName, githubToken) { //previously/may need later: target, url, data, done, error, progress
        // g5.load()

        // This provides symbolic names for the octal modes used by git trees.
        var modes = require('js-git/lib/modes');
        var run = require('gen-run');

        let repo = {}
        // Mixin the main library using github to provide the following:
        // - repo.loadAs(type, hash) => value
        // - repo.saveAs(type, value) => hash
        // - repo.listRefs(filter='') => [ refs ]
        // - repo.readRef(ref) => hash
        // - repo.updateRef(ref, hash) => hash
        // - repo.deleteRef(ref) => null
        // - repo.createTree(entries) => hash
        // - repo.hasHash(hash) => has
        require('js-github/mixins/github-db')(this.repo, githubName, githubToken);
        // Github has this built-in, but it's currently very buggy so we replace with
        // the manual implementation in js-git.
        require('js-git/mixins/create-tree')(this.repo);
        // Cache github objects locally in indexeddb
        var db = require('js-git/mixins/indexed-db')
        require('js-git/mixins/add-cache')(this.repo, db);
        // Cache everything except blobs over 100 bytes in memory.
        // This makes path-to-hash lookup a sync operation in most cases.
        require('js-git/mixins/mem-cache')(this.repo);
        // Combine concurrent read requests for the same hash
        require('js-git/mixins/read-combiner')(this.repo);
        // Add in value formatting niceties.  Also adds text and array types.
        require('js-git/mixins/formats')(this.repo);
        // Browser only: we need to initialize the indexeddb
        db.init(function(err) {
            if (err) throw err;
        })
    },

    createRepo: {function(){}},
    deleteRepo: {function(){}},
    create: {function(){}},
    delete: {function(){}},

    update: { function (PATH) {
        var headHash = yield repo.readRef("refs/heads/main"); //why not working? //old repos may use master, need updating to less awful language
        var commit = yield this.repo.loadAs("commit", headHash);
        var tree = yield this.repo.loadAs("tree", commit.tree);
        var entry = tree["README.md"];
        var readme = yield this.repo.loadAs("text", entry.hash);

        var updates = [
            {
              path: PATH, // Update the existing entry
              mode: entry.mode,  // Preserve the mode (it might have been executible)
              content: readme.toUpperCase() // Write the new content
            }
          ];
          // Based on the existing tree, we only want to update, not replace.
          updates.base = commit.tree;
        
          // Create the new file and the updated tree.
          var treeHash = yield repo.createTree(updates);
      }
    },
    commit: { function (PATH, MSG) {
        var commitHash = yield repo.saveAs("commit", {
            tree: treeHash,
            author: {
              name: AUTHOR,
              email: EMAIL
            },
            parent: headHash,
            message: MSG
          });
        
          // Now we can browse to this commit by hash, but it's still not in master.
          // We need to update the ref to point to this new commit.
        
          yield repo.updateRef("refs/heads/master", commitHash);
        }
    },

    test: "hello world",
    
    print: function () {
        //second function
        console.log("does a thing: " + this.test)
    }
}

// git5.print()
g5.load()

commit_msg = "g5js test commit"
PATH = "README.md"
g5.update(PATH)
// g5.commit(MSG) //commits all changes made up to that point