import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { getPublicAssetPath, IS_MOBILE } from '../../../../utils';
import { AvatarGLItemBaseWithParticle } from './base/AvatarGLItemBaseWithParticle';
import { loadingEE, LoadingSourceType } from '../../../app/App.utils';
import { padStart } from 'lodash-es';
import { GUI } from 'dat.gui';

export class AvatarGLItemLowpoly extends AvatarGLItemBaseWithParticle {
    public particleCanvasWidth = IS_MOBILE ? 249 : 840;
    public particleCanvasHeight = IS_MOBILE ? 320 : 1080;

    public extraNode = (
        <>
            <div className='avatar-extra-subtitle'>SecretShop</div>
            <div className='avatar-extra-text'>→ The marketplace</div>
            <div className='avatar-extra-subtitle'>GameMaster</div>
            <div className='avatar-extra-text'>→ The governance</div>
        </>
    );

    getParticleIndex() {
        return Math.floor(
            (((this.controls.getAzimuthalAngle() / Math.PI + 1) / 2) *
                this.imageDataArray.length +
                this.imageDataArray.length +
                215) %
                this.imageDataArray.length
        );
    }

    load() {
        if (this.loadingPromise) {
            return this.loadingPromise;
        }
        this.loadingPromise = new Promise((resolve, reject) => {
            let gltfLoaded = false;
            let imageLoaded = false;
            
            new GLTFLoader().load(
                getPublicAssetPath('files/avatar/SK_Lowpoly_Male_028.glb'),
                (gltf) => {
                    const ambientLight = new THREE.AmbientLight(0xb4d1f2, 0.2);
                    this.camera.add(ambientLight);
                    const directionalLight = new THREE.DirectionalLight(
                        0xeacfc1,
                        1.5
                    );
                    directionalLight.position.set(0.5, 0, 0.866); // ~60º
                    this.camera.add(directionalLight);

                    const model = gltf.scene;
                    model.position.set(-0.1, -2.77, 0.1);
                    model.scale.set(3.3, 3.3, 3.3);
                    // model.rotation.y = Math.PI * 1.7;
                    this.scene.add(model);

                    // const gui = new GUI();
                    // const folderScale = gui.addFolder('model.scale');
                    // folderScale.add(model.scale, 'x').step(0.01);
                    // folderScale.add(model.scale, 'y').step(0.01);
                    // folderScale.add(model.scale, 'z').step(0.01);
                    // const folderPosition = gui.addFolder('model.position');
                    // folderPosition.add(model.position, 'x').step(0.01);
                    // folderPosition.add(model.position, 'y').step(0.01);
                    // folderPosition.add(model.position, 'z').step(0.01);
                    // const cameraPosition = gui.addFolder('camera.position');
                    // cameraPosition.add(this.camera.position, 'x').step(0.01);
                    // cameraPosition.add(this.camera.position, 'y').step(0.01);
                    // cameraPosition.add(this.camera.position, 'z').step(0.01);
                    // gui.domElement.id = 'home-gl-gui';
                    // document.body.appendChild(gui.domElement);

                    this.mixer = new THREE.AnimationMixer(model);
                    // this.mixer?.clipAction(gltf.animations?.[0])?.play();
                    gltfLoaded = true;
                    this.loaded = gltfLoaded && imageLoaded;
                    if (this.loaded) {
                        this.container.classList.remove('loading');
                        resolve(true);
                    }
                    loadingEE.emit(
                        `progress.${LoadingSourceType.AVATAR_GLTF_LOWPOLY}`,
                        1
                    );
                },
                (event) => {
                    loadingEE.emit(
                        `progress.${LoadingSourceType.AVATAR_GLTF_LOWPOLY}`,
                        Math.min(
                            event.loaded / (event.total || 1024 * 1024 * 25),
                            0.95
                        )
                    );
                });
            
            new FBXLoader().load(
                getPublicAssetPath('files/avatar/SK_Lowpoly_Male_028_H.fbx'),
                (group) => {
                    var g = new THREE.SphereBufferGeometry(0.07)
                    var m = new THREE.MeshStandardMaterial()
                    m.transparent = true
                    m.opacity = 0.8
                    var m_color = new THREE.Color("#99ddff")
                    var pts : Array<THREE.Vector3> = []
                    var cluster
        
                    var box3 = new THREE.Box3().setFromObject(group);
                    var size = new THREE.Vector3();
                    box3.getSize(size);
                    const param = 50 / Math.max(size.x, size.y, size.z);
                    group.scale.set(param, param, param);
                            
                    let v3 = new THREE.Vector3();
                    group.traverse(child => {
                        if ((child as THREE.Mesh).isMesh){
                            
                            let pos = (child as THREE.Mesh).geometry.attributes.position;
                            (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({color:"black"})
                            for (let i = 1; i < pos.count; i+=40){
                                v3.fromBufferAttribute(pos, i)
                                v3.x = v3.x *param
                                v3.y = v3.y *param
                                v3.z = v3.z *param
                                pts.push(v3.clone());
                            }
                        }
                    });
        
                    this.scene.add(group)
          
                    m.emissive = m_color
                    m.emissiveIntensity = 0.3
                    m.color = m_color
        
                    cluster = new THREE.InstancedMesh(g, m, pts.length)
                    cluster.instanceMatrix.needsUpdate = true
        
                    var dummy = new THREE.Object3D();
                    console.log(pts);
                    for (let i = 0; i < pts.length; i++){
                        dummy.position.set(pts[i].x, pts[i].y, pts[i].z);
                        dummy.updateMatrix()
                        cluster.setMatrixAt(i, dummy.matrix)
                    }
        
                    this.scene.add(cluster)


                },
                (event) => {
                    loadingEE.emit(
                        `progress.${LoadingSourceType.AVATAR_GLTF_LOWPOLY_PARTICLE}`,
                        Math.min(
                            event.loaded / (event.total || 1024 * 1024 * 25),
                            0.95
                        )
                    );
                });

            new FBXLoader().load(
                getPublicAssetPath('files/avatar/SK_Lowpoly_Male_028_L.fbx'),
                (group) => {
                    var g_l = new THREE.SphereBufferGeometry(0.12)
                    var m_l = new THREE.MeshStandardMaterial()
                    m_l.transparent = true
                    m_l.opacity = 0.8
                    var m_l_color = new THREE.Color("#99ddff")
                    var pts_l : Array<THREE.Vector3> = []
                    var cluster_l
            
                    let center

                    const box3 = new THREE.Box3().setFromObject(group);
                    const size = new THREE.Vector3();
                    box3.getSize(size);
                    const param = 50 / Math.max(size.x, size.y, size.z);
                    group.scale.set(param, param, param);
                    center = new THREE.Vector3();
                    box3.getCenter(center);
                        
                    let v3 = new THREE.Vector3();
                    group.traverse(child => {
                        if ((child as THREE.Mesh).isMesh){
                            let pos = (child as THREE.Mesh).geometry.attributes.position;
                            console.log(pos.count)
                            for (let i = 1; i < pos.count; i+=10){
                                v3.fromBufferAttribute(pos, i)
                                v3.x = v3.x *param
                                v3.y = v3.y *param
                                v3.z = v3.z *param
                                pts_l.push(v3.clone());
                            }
                        }
                    });
                        
                    m_l.emissive = m_l_color
                    m_l.emissiveIntensity = 0.3
                    m_l.color = m_l_color
                      
                    cluster_l = new THREE.InstancedMesh(g_l, m_l, pts_l.length)
                    cluster_l.instanceMatrix.needsUpdate = true
                      
                    var dummy = new THREE.Object3D();
                    for (let i = 0; i < pts_l.length; i++){
                        dummy.position.set(pts_l[i].x, pts_l[i].y, pts_l[i].z);
                        dummy.updateMatrix()
                        cluster_l.setMatrixAt(i, dummy.matrix)
                    }
                        
                    this.scene.add(cluster_l)
                },
                (event) => {
                    loadingEE.emit(
                        `progress.${LoadingSourceType.AVATAR_GLTF_LOWPOLY_PARTICLE}`,
                        Math.min(
                            event.loaded / (event.total || 1024 * 1024 * 25),
                            0.95
                        )
                    );
                });


            // const imageUrls = new Array(480).fill(0).map((_, i) => {
            //     padStart(`${i + 1}`, 3, '0');
            //     return getPublicAssetPath(
            //         `files/avatar/avatar-lowpoly-particle${
            //             IS_MOBILE ? '-mobile' : ''
            //         }/${padStart(`${i + 1}`, 3, '0')}.jpg`
            //     );
            // });
            // const imageLoader = new THREE.ImageLoader();
            // Promise.all(imageUrls.map((url) => imageLoader.load(url))).then(
            //     (data) => {
            //         this.imageDataArray = data;
            //         imageLoaded = true;
            //         this.loaded = gltfLoaded && imageLoaded;
            //         if (this.loaded) {
            //             this.container.classList.remove('loading');
            //             resolve(true);
            //         }
            //         loadingEE.emit(
            //             `progress.${LoadingSourceType.AVATAR_GLTF_LOWPOLY_PARTICLE}`,
            //             1
            //         );
            //     }
            // );
        }).then(() => {
            setTimeout(() => {
                // 首次渲染，做个延时防止影响首屏的入场
                this.render();
            }, 3000);
        });
        return this.loadingPromise;
    }
}
