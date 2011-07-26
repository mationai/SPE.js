import sys
import os

outfile_str = "spe.js" or sys.argv[1]
file_list = \
 "spe_base.js math.js vector.js world.js collision.js group.js particle.js shapes.js".split()

outfile = open(outfile_str, 'w')
outfile.write("// Simple Physics Engine (generated single source file)\n\n")

for f in file_list:
    outfile.write(
    "//============================ %s =============================\n\n" % f)
    outfile.write(open(f).read())
    outfile.write("\n\n\n")
outfile.close()