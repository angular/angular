module TicGitNG
  module Command
    module Recent
      def parser(opts)
        opts.banner = 'Usage: ti recent'
      end

      def execute
        # "args[0]" seems to be superfluous.  It's usage
        # is undocumented, and supplying an argument
        # doesn't seem to do anything.
        #
        # Im guessing the purpose of args[0] was to provide a
        # specific ticket_id whos history would be looked up
        # intead of looking up the history for all tickets.
        #
        # #FIXME Reimplement that functionality and updte
        # docs to match
        tic.ticket_recent(args[0]).each do |commit|
          sha = commit.sha[0, 7]
          date = commit.date.strftime("%m/%d %H:%M")
          message = commit.message

          puts "#{sha}  #{date}\t#{message}"
        end
      end
    end
  end
end
