from classe.ContenueSimilar import ContenueSimilar

recommandation = ContenueSimilar()
recommandation.preprocessingByStyleMusique()
print("lancement Python")
while True:
    lineRead = input()
    data = lineRead.split(':')
    commande = data[0]
    args = data[1]
    tupleDataLine = (commande, args)
    if tupleDataLine[0] == "getMusiqueSimilar":
        print(recommandation.getMusiqueSimilar(args))#Id musique #getMusiqueSimilar:id