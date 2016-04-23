module TicGitNG
  module Command
    module State
      def parser(opts)
        opts.banner = "Usage: ti state [ticid] state"
      end

      def execute
        if args.size > 1
          tid, new_state = args[0].strip, args[1].strip

          if valid_state?(new_state)
            tic.ticket_change(new_state, tid)
          else
            puts "Invalid State - please choose from: #{joined_states}"
          end
        elsif args.size > 0
          # new state
          new_state = args[0].chomp

          if valid_state?(new_state)
            tic.ticket_change(new_state)
          else
            puts "Invalid State - please choose from: #{joined_states}"
          end
        else
          puts 'You need to at least specify a new state for the current ticket'
          puts "please choose from: #{joined_states}"
        end
      end

      def valid_state?(state)
        available_states.include?(state)
      end

      def available_states
        tic.tic_states.sort
      end

      def joined_states
        available_states.join(', ')
      end
    end
  end
end
