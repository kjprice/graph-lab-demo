import graphlab as gl

print('try to load model')

try:
  #gl.load_model('../python_notebooks/test')
  gl.load_model('model')
  print('model available')
  quit()
except Exception:
  print('creating model')


# TODO: add song title to model
usage_data = gl.SFrame.read_csv("./data/kaggle_visible_evaluation_triplets.txt",
                                header=False,
                                delimiter='\t',
                                column_type_hints={'X3':int})


usage_data.rename({'X1':'user', 'X2': 'song_id', 'X3': 'plays'})

songs = gl.SFrame.read_csv("./data/song_data.csv")

ud_df = usage_data.to_dataframe()
song_df = songs.to_dataframe()

new_df = ud_df.merge(song_df, how='left', left_on='song_id', right_on='song_id')

combo_songs = gl.SFrame(new_df)
combo_songs['song_id'] = combo_songs['title'] + ' (' + combo_songs['artist_name'] + ')'

# TODO: Update with new params
# TODO: Display song title to user
item_item_model = gl.recommender.item_similarity_recommender.create(combo_songs,
                                  user_id='user',
                                  item_id='song_id',
                                  target='plays')

item_item_model.save('model')