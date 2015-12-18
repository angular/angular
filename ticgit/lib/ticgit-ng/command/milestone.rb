module TicGitNG
  module Command
    # tic milestone
    # tic milestone migration1 (list tickets)
    # tic milestone -n migration1 3/4/08 (new milestone)
    # tic milestone -a {1} (add ticket to milestone)
    # tic milestone -d migration1 (delete)
    module Milestone
      def parser(opts)
        opts.banner = "Usage: ti milestone [milestone_name] [options] [date]"

        opts.on_head(
          "-n MILESTONE", "--new MILESTONE",
          "Add a new milestone to this project"){|v| options.new = v }

        opts.on_head(
          "-a TICKET", "--new TICKET",
          "Add a ticket to this milestone"){|v| options.add = v }

        opts.on_head(
          "-d MILESTONE", "--delete MILESTONE",
          "Remove a milestone"){|v| options.remove = v }
      end
    end
  end
end
