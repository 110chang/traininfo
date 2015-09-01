# -*- encoding: utf-8 -*-
# ruby csv2json.rb lines.csv

require 'csv'
require 'uri'
require 'net/https'
require 'json'

path_to_csv = ARGV[0]
path_to_json = path_to_csv.gsub(/\.csv$/, '.json')

lines = CSV.read(path_to_csv, :headers => true).map(&:to_hash)

p lines.size

API_BASE = 'http://express.heartrails.com/api/json?method=getStations&line='

orig = File.open('./lines.json.orig.json') do |io|
  JSON.load(io)
end

new_lines = []

#sample = orig.index do |v|
#  v['goo_key'] == '湘南新宿ライン'
#end
#p sample

#lines.take(1).each do |line|
lines.each.with_index(0) do |line, i|
  #p line['ignore'].to_i
  if line['ignore'].to_i == 1 then
    next
  end
  orig_idx = orig.index do |v|
    v['goo_key'] == line['goo_key']
  end
  if !orig_idx.nil? then
    #p orig[orig_idx]['goo_key']
    line['stations'] = orig[orig_idx]['stations']
  else
    #p line['goo_key']
    url = API_BASE + URI.escape(line['heartrails_key'])
    uri = URI.parse(url)
    json = JSON.parse(Net::HTTP.get(uri))
    line['stations'] = json['response']['station']
  end
  line['loop'] = line['loop'] == 1 ? true : false
  line['subway'] = line['subway'] == 1 ? true : false
  line['id'] = i
  #p line['name']
  new_lines.push(line)
end

p new_lines.size

File.open(path_to_json, 'w') { |f| f.write(new_lines.to_json) }