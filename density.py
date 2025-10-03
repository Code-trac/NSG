# density.py
import numpy as np

def estimate_density(frame_shape, boxes, grid_size=(8,6)):
    h, w = frame_shape[:2]
    gw, gh = grid_size
    grid = np.zeros((gh, gw), dtype=int)
    for b in boxes:
        x1,y1,x2,y2 = b
        cx = (x1+x2)//2
        cy = (y1+y2)//2
        gx = int(cx / w * gw)
        gy = int(cy / h * gh)
        gx = min(max(gx,0), gw-1)
        gy = min(max(gy,0), gh-1)
        grid[gy, gx] += 1
    return grid
