from sklearn.manifold import TSNE
import pandas as pd
import os
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
Axes3D

def init():
    modelTSNE = TSNE()
    dataFrame = pd.read_csv("../out/ClassificationMusiqueTrain.csv")
    standardisationSpotifyData = dataFrame.drop(dataFrame.columns[:3], axis=1)
    standardisationSpotifyData.drop("duration_in min/ms", axis=1, inplace=True)

    standardisationSpotifyData.dropna(inplace=True)
    y_data = standardisationSpotifyData["Class"]  # Fait la list des class de type de musique
    musiqueStatistiqueData = standardisationSpotifyData.drop("Class", axis=1)

    #for i in range(5, 55, 5):
    modelTSNE.perplexity = 100
    data = modelTSNE.fit_transform(musiqueStatistiqueData, y_data)
    fig = plt.figure(figsize=(15, 8))
    plt.scatter(data[:, 0], data[:, 1], c=y_data, cmap=plt.cm.Spectral)
    plt.show()



if __name__ == "__main__":
    init()
