import pandas as pd
import math
import sys
import sklearn
import matplotlib.pyplot as plt
import numpy as np
import networkx as nx
from sklearn.metrics.pairwise import cosine_similarity
import os
from sklearn import tree

from sklearn.model_selection import train_test_split


class Recommandation:

    def __init__(self):
        self.data = pd.read_csv(os.path.abspath("/home/aafcjm/public_html/input/musiquecompile/dataCompile.csv"))
        self.isPreprocessed = False
        self.isPreprocessedByStyleMusique = False

    def preprocessing(self):
        self.isPreprocessed = True
        self.preprocessingByStyleMusique()
        return

    def preprocessingByStyleMusique(self):
        self.isPreprocessedByStyleMusique = True
        dataFrame = pd.read_csv(os.path.abspath("/home/aafcjm/public_html/input/train.csv"))
        standardisationSpotifyData = dataFrame.drop(dataFrame.columns[:3], axis=1)
        y_data = standardisationSpotifyData["Class"]  # Fait la list des class de type de musique
        musiqueStatistiqueData = standardisationSpotifyData.drop("Class", axis=1)

        musiqueStatistiqueData["instrumentalness"].fillna(musiqueStatistiqueData["instrumentalness"].mean(),
                                                          inplace=True)
        musiqueStatistiqueData["key"].fillna(musiqueStatistiqueData["key"].mean(), inplace=True)

        # Egalisation des données
        minData = musiqueStatistiqueData.shape[0]
        classType = []
        # Par cour les 10 class pour connaitre la class avec le moins d'éléments
        for i in range(11):
            classType.append(standardisationSpotifyData[standardisationSpotifyData["Class"] == i])
            minSize = classType[i].shape[0]
            if minData > minSize:
                minData = minSize

        musiqueClassEqual = pd.DataFrame(columns=classType[0].columns)
        for df in classType:
            musiqueClassEqual = pd.concat([musiqueClassEqual, df[:minData]], ignore_index=True)

        musiqueClassEqual = musiqueClassEqual.sample(frac=1).reset_index(drop=True)
        musiqueClassEqual.drop("duration_in min/ms", axis=1, inplace=True)
        musiqueClassEqual["instrumentalness"].fillna(musiqueClassEqual["instrumentalness"].mean(), inplace=True)
        musiqueClassEqual["key"].fillna(musiqueClassEqual["key"].mean(), inplace=True)

        X_train, X_test, Y_train, Y_test = train_test_split(musiqueClassEqual.drop("Class", axis=1),
                                                            musiqueClassEqual["Class"], test_size=.3)
        Y_train = Y_train.astype('int')
        Y_test = Y_test.astype('int')

        dtc = tree.DecisionTreeClassifier(max_leaf_nodes=40, min_samples_leaf=10)
        dtc.fit(X_train, Y_train)

        tmpData = self.data
        tmpData.drop(tmpData.columns[:5], axis=1, inplace=True)
        tmpData.drop(tmpData.columns[11:17], axis=1, inplace=True)
        self.data["class"] = dtc.predict(tmpData)
        return

    """
        Vas faire l'affinage (reclassement)
    """
    def affinagePredictionByStyleMusique(self):
        if not self.isPreprocessedByStyleMusique:
            self.preprocessingByStyleMusique()

        return

    def normaliseExportData(self, dataFrame: pd.DataFrame, columnsNeed=None):
        if columnsNeed is None:
            columnsNeed = ["artiste_name", "song_name", "id"]
        if not (dataFrame.columns in columnsNeed):
            return "ERROR COLUMNS"
        allColumns = dataFrame.columns
        allColumns = list(allColumns)
        for i in columnsNeed:
            allColumns.remove(i)
        return pd.DataFrame(dataFrame.drop(allColumns, axis=1), columns=columnsNeed)
