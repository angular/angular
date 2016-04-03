module TicGitNG
  module Command
    # Assigns points to a ticket
    #
    # Usage:
    # ti points {1} {points}   (assigns points to a specified ticket)
    module Points
      def parser(opts)
        opts.banner = "ti points [ticket_id] points"
      end

      def execute
        case args.size
        when 1
          new_points = args[0].to_i
        when 2
          tid = args[0]
          new_points = args[1].to_i
        else
          puts usage
          exit 1
        end

        tic.ticket_points(new_points, tid)
      end
    end
  end
end
