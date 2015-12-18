module TicGitNG
  module Command
    module Sync
      def parser(opts)
        opts.banner = "Usage: ti sync [options]"
        opts.on_head(
          "-r REPO", "--repo REPO", "Sync ticgit-ng branch with REPO"){|v|
          options.repo = v
        }
        opts.on_head(
          "-n", "--no-push", "Do not push to the remote repo"){|v|
          options.no_push = true
        }
      end

      def execute
        if options.repo and options.no_push
          tic.sync_tickets(options.repo, false)
        elsif options.repo
          tic.sync_tickets(options.repo)
        elsif options.no_push
          tic.sync_tickets('origin', false)
        else
          tic.sync_tickets()
        end
      end
    end
  end
end
