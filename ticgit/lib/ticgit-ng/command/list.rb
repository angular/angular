module TicGitNG
  module Command
    # List tickets
    module List
      def parser(o)
        o.banner = "Usage: ti list [options]"
        o.on_head(
          "-o ORDER", "--order ORDER",
          "Field to order by - one of : assigned,state,date,title"){|v|
          options.order = v
        }

        o.on_head(
          "-t TAG[,TAG]", "--tags TAG[,TAG]", Array,
          "List only tickets with specific tag(s)",
          "Prefix the tag with '-' to negate"){|v|
          options.tags ||= Set.new
          options.tags.merge v
        }

        o.on_head(
          "-s STATE[,STATE]", "--states STATE[,STATE]", Array,
          "List only tickets in a specific state(s)",
          "Prefix the state with '-' to negate"){|v|
          options.states ||= Set.new
          options.states.merge v
        }

        o.on_head(
          "-a ASSIGNED", "--assigned ASSIGNED",
          "List only tickets assigned to someone"){|v|
          options.assigned = v
        }

        o.on_head("-S SAVENAME", "--saveas SAVENAME",
                     "Save this list as a saved name"){|v|
          options.save = v
        }

        o.on_head("-l", "--list", "Show the saved queries"){|v|
          options.list = true
        }
      end

      def execute
        options.saved = args[0] if args[0]

        if tickets = tic.ticket_list(options.to_hash)
          counter = 0
          cols = [80, window_cols].max

          puts
          puts [' ', just('#', 4, 'r'),
            just('TicId', 6),
            just('Title', cols - 56),
            just('State', 5),
            just('Date', 5),
            just('Assgn', 8),
            just('Tags', 20) ].join(" ")

          puts "-" * cols

          tickets.each do |t|
            counter += 1
            tic.current_ticket == t.ticket_name ? add = '*' : add = ' '
            puts [add, just(counter, 4, 'r'),
              t.ticket_id[0,6],
              just(t.title, cols - 56),
              just(t.state, 5),
              t.opened.strftime("%m/%d"),
              just(t.assigned_name, 8),
              just(t.tags.join(','), 20) ].join(" ")
          end
          puts
        end

      end
    end
  end
end
