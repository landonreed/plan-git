from __future__ import print_function
import csv
import json


f = open( '../projects.csv', 'r' )
reader = csv.DictReader( f, fieldnames = ( "ARCID", "Description", "Jurisdiction", "ModelingNetworkYear", "Sponsor", "ExistLanes", "ProposedLanes", "Length", "GDOTPI", "Limits", "Status", "ProjectType", "Analysis", "Phase", "PhaseStatus", "FiscalYear", "FundSource", "Federal", "State", "Local", "Bond", "Total", "FederalSum", "StateSum", "LocalSum", "BondSum", "TotalSum" ) )
out = json.dumps( [ row for row in reader ] )
o=open ('../projects.json' , 'w')
print(out, file=o)