module TicGitNG
  module Command
    module Checkout
      def parser(opts)
        opts.banner = "ti checkout [ticid]"
      end

      def execute
        tid = args[0]
        tic.ticket_checkout(tid)
      end
    end
  end
end
