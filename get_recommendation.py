import sys
import fileinput
from graphlab import load_model, SFrame

loaded_model = load_model('model')

sys.stderr.write('started\n')
while True:
  request = raw_input('Please provide a song_id\n').split('||')
  song_id = request[0]
  client_id = request[1]
  if song_id == '':
    song_id = 'SOVDSJC12A58A7A271'

  new_observations = SFrame({'user': ['NEW_USER'], 'song_id': [song_id], 'plays': [1]})
  recommendations = loaded_model.recommend(users=['NEW_USER'], new_observation_data=new_observations)
  sys.stderr.write(client_id + '||' + recommendations.to_dataframe().to_json(orient='records'))
