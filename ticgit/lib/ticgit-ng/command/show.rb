module TicGitNG
  module Command
    module Show
      def parser(opts)
        opts.banner = "Usage: ti show [--full] [ticid]"
        opts.on_head(
          "-f", "--full", "Show long comments in full, don't truncate after the 5th line"){|v|
          options.full= v
        }
      end

      def execute
        t = tic.ticket_show(args[0])
        ticket_show(t, options.full ) if t
      end
    end
  end
end
