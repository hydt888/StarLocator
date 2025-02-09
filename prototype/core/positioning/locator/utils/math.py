import numpy as np


def vector_angle(vec1, vec2):
    cos_theta = np.dot(vec1, vec2.T) / (
        np.linalg.norm(vec1, axis=-1) * np.linalg.norm(vec2, axis=-1)
    )
    cos_theta = np.clip(cos_theta, -1, 1)
    return np.arccos(cos_theta)


def cart2sph(x, y, z):
    hxy = np.hypot(x, y)
    r = np.hypot(hxy, z)
    elev = np.arctan2(z, hxy)  # for elevation angle defined from Z-axis down
    az = np.arctan2(y, x)
    return az, elev, r


def sph2cart(az, elev, r=1):
    rcos_theta = r * np.cos(elev)
    x = rcos_theta * np.cos(az)
    y = rcos_theta * np.sin(az)
    z = r * np.sin(elev)
    return x, y, z


def sph_dist(az1, elev1, az2, elev2):
    return np.arccos(
        np.sin(elev1) * np.sin(elev2)
        + np.cos(elev1) * np.cos(elev2) * np.cos(az1 - az2)
    )
