# -*- encoding: utf-8 -*-
# $ ruby joban.rb lines.json

require 'csv'
require 'json'

path = ARGV[0]

json = File.open(path) do |io|
  JSON.load(io)
end

json.each.with_index(0) do |line, i|
  if false#line["name"].scan(/常磐線/).size > 0
    #p line["name"]
    str = CSV.generate do |csv|
      line["stations"].each.with_index() do |station, j|
        #p station
        csv << station.keys if j == 0
        csv << station.values
      end
    end
    #p line
    #File.open("stations-#{i}.csv", 'w') { |f| f.write(str) }
  end
  if line["name"].scan(/JR常磐線$/).size > 0
    p line["stations"].size
    stations = CSV.read("stations-#{i}.csv", :headers => true).map(&:to_hash)
    #p stations
    line["stations"] = stations
    p line["stations"].size
  end
end

File.open("lines2.json", 'w') { |f| f.write(json.to_json) }

# csv_string = CSV.generate do |csv|
#   JSON.parse(File.open("foo.json").read).each do |hash|
#     csv << hash.values
#   end
# end